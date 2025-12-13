import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Bell, Check, X, FileText } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import type { Notification } from '../types';

interface NotificationsPageProps {
  accessToken: string;
  onBack: () => void;
}

export function NotificationsPage({ accessToken, onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/notifications`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (notificationId: string, approved: boolean) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/verify-report/${notificationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error verifying report:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl">Notifications</h1>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400">You'll be notified when there are updates</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={!notification.read ? 'border-l-4 border-l-blue-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-full ${
                    notification.type === 'verification' ? 'bg-yellow-100' :
                    notification.type === 'report' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      notification.type === 'verification' ? 'text-yellow-600' :
                      notification.type === 'report' ? 'text-blue-600' :
                      'text-green-600'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <p className={!notification.read ? '' : 'text-gray-600'}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>

                    {notification.type === 'verification' && !notification.read && notification.data && (
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleVerify(notification.id, true)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVerify(notification.id, false)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {notification.read && notification.type !== 'verification' && (
                      <p className="text-xs text-gray-500 mt-2">✓ Read</p>
                    )}

                    {!notification.read && notification.type !== 'verification' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
