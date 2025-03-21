import { motion } from "framer-motion";
import { AuthForm } from "../components/auth-form";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
        </div>
        <AuthForm />
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/80 to-primary/60 items-center justify-center p-12 relative overflow-hidden dark:from-primary/20 dark:via-primary/30 dark:to-primary/40">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="max-w-lg text-white relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to our Platform
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Your secure gateway to a world of possibilities. Join us today and experience
              seamless authentication with cutting-edge security.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}