import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
      </div>

      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <motion.h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome, {user?.username}!
            </motion.h1>
            <p className="text-gray-400">Your secure dashboard awaits</p>
          </motion.div>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="border-white/10 text-blue hover:bg-white/10 transition-colors"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-400">Username:</span>{" "}
                    {user?.username}
                  </p>
                  <p>
                    <span className="text-gray-400">Status:</span> Active
                  </p>
                  <p>
                    <span className="text-gray-400">Last Login:</span> Just now
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-400">Authentication:</span>{" "}
                    Secure
                  </p>
                  <p>
                    <span className="text-gray-400">Session:</span> Protected
                  </p>
                  <p>
                    <span className="text-gray-400">Encryption:</span> Enabled
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  System Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-400">Environment:</span>{" "}
                    Production
                  </p>
                  <p>
                    <span className="text-gray-400">Version:</span> 1.0.0
                  </p>
                  <p>
                    <span className="text-gray-400">Framework:</span> React +
                    Vite
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
