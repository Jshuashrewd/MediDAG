import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Coins, ArrowLeft, Trophy, CheckCircle } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import type { Task, User } from '../types';

interface OrionCoinsPageProps {
  accessToken: string;
  onBack: () => void;
}

export function OrionCoinsPage({ accessToken, onBack }: OrionCoinsPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const profileData = await profileResponse.json();
      setUser(profileData.profile);

      // Fetch tasks
      const tasksResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-140653bc/user/tasks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks);
    } catch (error) {
      console.error('Error fetching coins data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl">Orion Coins</h1>
            <p className="text-sm text-gray-600">Earn rewards for staying healthy</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Coins Balance Card */}
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-2">Your Balance</p>
                <div className="flex items-center gap-3">
                  <Coins className="w-12 h-12" />
                  <span className="text-5xl">{user?.orionCoins || 0}</span>
                </div>
                <p className="text-sm opacity-90 mt-2">Orion Coins</p>
              </div>
              <Trophy className="w-24 h-24 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{tasks.filter(t => t.completed).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Available Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{tasks.filter(t => !t.completed).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Potential Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-yellow-600">
                {tasks.filter(t => !t.completed).reduce((sum, t) => sum + t.coins, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Available Tasks</CardTitle>
            <CardDescription>Complete tasks to mine Orion Coins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className={task.completed ? 'bg-gray-50' : 'border-l-4 border-l-yellow-500'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</h3>
                          {task.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                          <Coins className="w-4 h-4" />
                          <span>+{task.coins}</span>
                        </div>
                        {!task.completed && (
                          <Button size="sm">Start Task</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="mb-2">What are Orion Coins?</h3>
            <p className="text-sm text-gray-700">
              Orion Coins are rewards you earn for staying engaged with your health. Complete tasks like
              uploading medical records, booking checkups, and maintaining medication adherence to earn coins.
              These coins can be redeemed for health services, discounts, or other rewards in the future.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}