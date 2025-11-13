import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Palette,
  Database,
  LogOut,
  Save,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("profile");

  // Form states
  const [displayName, setDisplayName] = useState(session?.user.name || "");
  const [email, setEmail] = useState(session?.user.email || "");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);

  const sections = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Lock },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "data", name: "Data & Privacy", icon: Database },
  ];

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile:", { displayName, email });
  };

  const handleChangePassword = () => {
    // TODO: Implement password change functionality
    console.log("Change password requested");
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // TODO: Implement account deletion API call
      console.log("Delete account requested");
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            {activeSection === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>

                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleChangePassword} variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                      Manage your active sessions across devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">
                            This device
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded">
                          Active
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Sign Out
                    </CardTitle>
                    <CardDescription>
                      Sign out of your account on this device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Button
                      variant={emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEmailNotifications(!emailNotifications)}
                    >
                      {emailNotifications ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Workout Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get reminded to complete your workouts
                      </p>
                    </div>
                    <Button
                      variant={workoutReminders ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWorkoutReminders(!workoutReminders)}
                    >
                      {workoutReminders ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Achievement Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you unlock achievements
                      </p>
                    </div>
                    <Button
                      variant={achievementAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAchievementAlerts(!achievementAlerts)}
                    >
                      {achievementAlerts ? "On" : "Off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeSection === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how Ralphie Fitness looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <button className="p-4 border rounded-lg hover:border-primary transition-colors">
                        <div className="w-full h-20 bg-white rounded mb-2"></div>
                        <p className="text-sm font-medium">Light</p>
                      </button>
                      <button className="p-4 border border-primary rounded-lg">
                        <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                        <p className="text-sm font-medium">Dark</p>
                      </button>
                      <button className="p-4 border rounded-lg hover:border-primary transition-colors">
                        <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 rounded mb-2"></div>
                        <p className="text-sm font-medium">Auto</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data & Privacy Settings */}
            {activeSection === "data" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>
                      Download a copy of your workout data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Delete Account
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      This action cannot be undone. All your workout data,
                      templates, and progress will be permanently deleted.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
