import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  Newspaper, 
  TrendingUp, 
  LogOut,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import UserVerificationDialog from "@/components/admin/UserAction";
import NewsDetailsDialog from "@/components/admin/NewsDetailDialog";
import EventDetailsDialog from "@/components/admin/EventDetailDialog";


type User = {
    id: string;
    name: string;
    sport: string;
    role: string;
    registrationDate: string;
    verificationStatus: "verified" | "unverified" | "rejected";
};

type Event = {
  id: number;
  title: string;
  organizer: string;
  type: string;
  sport: string;
  startdatetime: string;
  enddatetime: string;
  participants: string | number;
  status: string;
  description: string;
};

export type NewsArticle = {
  news_id: string;           
  title: string | null;      
  author_name: string | null; 
  content: string | null;    
  category: string | null;  
  publish_date: string | null; 
  event_date: string | null;   
  location: string | null;     
};

type AthleteStatsRow = {
  id: string;
  name: string;
  sport: string;
  ppg: number;
  rpg: number;
  apg: number;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  
  const [events, setEvents] = useState<Event[]>([
  {
    id: 1,
    title: "Basketball Championship",
    organizer: "John Doe",
    type: "Tournament",
    sport: "Basketball",
    startdatetime: "2024-06-15T09:00",
    enddatetime: "2024-06-15T18:00",
    participants: 24,
    status: "upcoming",
    description: "Annual basketball championship event."
  },
  {
    id: 2,
    title: "Volleyball League",
    organizer: "Jane Smith",
    type: "League",
    sport: "Volleyball",
    startdatetime: "2024-05-20T10:00",
    enddatetime: "2024-05-20T17:00",
    participants: 16,
    status: "ongoing",
    description: "Seasonal volleyball league."
  }
]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/get-users/users");
        if (!res.ok) throw new Error("Failed to fetch users");

        const data: User[] = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  
  const [news, setNews] = useState<NewsArticle[]>([
  {
    news_id: "1",                     
    title: "New Season Announcement",
    author_name: "Admin",             
    publish_date: "2024-04-01",       
    content: "Welcome to the new season! We have exciting updates...", 
    category: "General",              
    event_date: null,                 
    location: null,                   
  },
]);
  
  const [athleteStats, setAthleteStats] = useState<AthleteStatsRow[]>([
    { id: "1", name: "John Doe", sport: "Basketball", ppg: 15.5, rpg: 8.2, apg: 4.3 },
    { id: "2", name: "Jane Smith", sport: "Volleyball", ppg: 12.3, rpg: 6.5, apg: 3.8 },
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.verificationStatus === "verified").length;
  const pendingUsers = users.filter(u => u.verificationStatus === "unverified").length;
  const totalEvents = events.length;
  const totalNews = news.length;

  const handleVerificationChange = async (userId: string, status: "verified" | "unverified" | "rejected") => {
    // Optimistic UI update
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, verificationStatus: status } : u
    ));
    
    try {
      // FIX: Changed 'users' to 'user-action'
      const response = await fetch(`http://localhost:5000/api/user-action/verify/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to verify user');
      
    } catch (error) {
      console.error(error);
      alert("Failed to update verification status on server");
    }
    
    setSelectedUser(null);
  };

  const handleDeleteUser = async (argId: string) => {
    // Safety check: ensure we have a valid ID string
    const userId = typeof argId === 'string' ? argId : selectedUser?.id;
    
    if (!userId) {
        console.error("No user ID provided for deletion");
        return;
    }

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      // FIX: Changed 'users' to 'user-action'
      const response = await fetch(`http://localhost:5000/api/user-action/delete/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(prev => prev.filter(u => u.id !== userId));
      setSelectedUser(null); 
      alert("User deleted successfully");

    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };
  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      // Make sure this endpoint matches your backend route
      const response = await fetch(`http://localhost:5000/api/events/delete/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');

      // Remove event from local state
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setSelectedEvent(null); // Close the dialog
      alert("Event deleted successfully");

    } catch (error) {
      console.error(error);
      alert("Failed to delete event");
    }
  };

  const handleResetPassword = async (argId: string) => {
    // Safety check: ensure we have a valid ID string
    const userId = typeof argId === 'string' ? argId : selectedUser?.id;

    if (!userId) {
        console.error("No user ID provided for reset");
        return;
    }

    try {
      // FIX: Changed 'users' to 'user-action'
      const response = await fetch(`http://localhost:5000/api/user-action/reset-password/${userId}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send reset email');

      alert("Password reset email sent to the user.");
      setSelectedUser(null); 

    } catch (error) {
      console.error(error);
      alert("Failed to send password reset email");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          file.type === "application/vnd.ms-excel" ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')) {
        setUploadedFile(file);
      } else {
        alert("Please upload an Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleUploadStats = () => {
    if (uploadedFile) {
      console.log("Uploading file:", uploadedFile.name);
      // Here you would process and upload the file
      alert(`File "${uploadedFile.name}" ready to upload!`);
      setUploadedFile(null);
    }
  };

  const handleStatChange = (id: string, field: "ppg" | "rpg" | "apg", value: string) => {
    setAthleteStats(prev =>
      prev.map(row =>
        row.id === id
          ? { ...row, [field]: isNaN(parseFloat(value)) ? 0 : parseFloat(value) }
          : row
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, events, news, and athlete statistics
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto bg-white dark:bg-slate-900 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalUsers}</p>
                  <p className="text-xs opacity-80 mt-1">
                    {verifiedUsers} verified, {pendingUsers} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalEvents}</p>
                  <p className="text-xs opacity-80 mt-1">Active and upcoming</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Published News</CardTitle>
                  <Newspaper className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalNews}</p>
                  <p className="text-xs opacity-80 mt-1">Articles published</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Athletes Tracked</CardTitle>
                  <TrendingUp className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{athleteStats.length}</p>
                  <p className="text-xs opacity-80 mt-1">With statistics</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground">Jane Smith joined 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Event created</p>
                        <p className="text-xs text-muted-foreground">Basketball Championship added</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Stats updated</p>
                        <p className="text-xs text-muted-foreground">John Doe's stats modified</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Users className="h-4 w-4" />
                    Review Pending Verifications ({pendingUsers})
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Calendar className="h-4 w-4" />
                    Create New Event
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Upload className="h-4 w-4" />
                    Upload Athlete Stats
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-sm text-muted-foreground">Manage user accounts and verification status</p>
              </div>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Add User
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Verification Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.sport}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.registrationDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.verificationStatus === "verified"
                                ? "default"
                                : user.verificationStatus === "unverified"
                                ? "secondary"
                                : "destructive"
                            }
                            className="capitalize"
                          >
                            {user.verificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Events Management</h2>
                <p className="text-sm text-muted-foreground">Organize and track sporting events</p>
              </div>
              <Button className="gap-2">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Start Date & Time</TableHead>
                      <TableHead>End Date & Time</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.organizer}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{event.sport}</TableCell>
                        <TableCell>{event.startdatetime}</TableCell>
                        <TableCell>{event.enddatetime}</TableCell>
                        <TableCell>{event.participants}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.status === "completed"
                                ? "outline"
                                : event.status === "ongoing"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEvent(event)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">News Management</h2>
                <p className="text-sm text-muted-foreground">Publish and manage news articles</p>
              </div>
              <Button className="gap-2">
                <Newspaper className="h-4 w-4" />
                Create Article
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date Published</TableHead>
                      {/* Status column removed to match Type definition */}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.map((article) => (
                      <TableRow key={article.news_id}> {/* Updated: id -> news_id */}
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.author_name}</TableCell> {/* Updated: author -> author_name */}
                        <TableCell>{article.publish_date}</TableCell> {/* Updated: datePublished -> publish_date */}
                        
                        {/* Status Cell removed */}

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedNews(article)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Athlete Stats Management</h2>
                <p className="text-sm text-muted-foreground">Upload and manage athlete statistics</p>
              </div>
            </div>

            {/* File Upload Section */}
            <Card className="shadow-sm border-2 border-dashed">
              <CardContent className="pt-6">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Upload Athlete Stats</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  
                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                      <div className="mt-3 flex gap-2 justify-center">
                        <Button size="sm" onClick={handleUploadStats}>
                          Process & Upload
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadedFile(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <UserVerificationDialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onVerify={handleVerificationChange} 
        onDelete={handleDeleteUser}        
        onReset={handleResetPassword}
      />

      <EventDetailsDialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
      />

      <NewsDetailsDialog
        open={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        news={selectedNews}
        onDelete={(id) => {
          setSelectedNews(null); 
        }}
      />
    </div>
  );
};

export default AdminDashboard;