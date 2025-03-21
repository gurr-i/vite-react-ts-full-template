import { Button } from "@/components/ui/button";
import { useAuth } from "../features/auth/hooks/use-auth";
import { Loader2, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
      </div>

      <header className="border-b border-border/10 backdrop-blur-sm bg-card/20">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <motion.h1 className="text-3xl font-bold text-card-foreground">
              Welcome, {user?.username}!
            </motion.h1>
            <p className="text-muted-foreground">Your secure dashboard awaits</p>
          </motion.div>
          <div className="flex items-center gap-4">
            {/* ThemeToggle component needs to be imported and implemented */}
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="border-border/40 hover:bg-accent transition-colors"
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
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/10 bg-card/40 backdrop-blur-sm hover:bg-card/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground">
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-foreground">
                  <p>
                    <span className="text-muted-foreground">Username:</span>{" "}
                    {user?.username}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span> Active
                  </p>
                  <p>
                    <span className="text-muted-foreground">Last Login:</span> Just now
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
            <Card className="border-border/10 bg-card/40 backdrop-blur-sm hover:bg-card/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground">
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-foreground">
                  <p>
                    <span className="text-muted-foreground">Authentication:</span>{" "}
                    Secure
                  </p>
                  <p>
                    <span className="text-muted-foreground">Session:</span> Protected
                  </p>
                  <p>
                    <span className="text-muted-foreground">Encryption:</span> Enabled
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
            <Card className="border-border/10 bg-card/40 backdrop-blur-sm hover:bg-card/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground">
                  System Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-foreground">
                  <p>
                    <span className="text-muted-foreground">Environment:</span>{" "}
                    Production
                  </p>
                  <p>
                    <span className="text-muted-foreground">Version:</span> 1.0.0
                  </p>
                  <p>
                    <span className="text-muted-foreground">Framework:</span> React +
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
