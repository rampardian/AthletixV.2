import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Globe, ChevronLeft, Share2 } from "lucide-react";
import { format, parseISO, endOfDay } from "date-fns";
import EventEditModal from "@/components/events/EventEditModal";

const getEventStatus = (
  startStr: string | null,
  endStr: string | null
): "Completed" | "Ongoing" | "Upcoming" => {
  if (!startStr) return "Upcoming";

  const startDate = new Date(startStr);
  if (isNaN(startDate.getTime())) return "Upcoming";

  const effectiveEndDate = endStr ? new Date(endStr) : endOfDay(startDate);
  if (isNaN(effectiveEndDate.getTime())) return "Upcoming";

  const now = new Date();

  if (effectiveEndDate < now) return "Completed";
  if (now >= startDate && now <= effectiveEndDate) return "Ongoing";
  return "Upcoming";
};

const safeFormat = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return format(parseISO(dateStr), "PPP");
  } catch {
    return "Invalid Date";
  }
};

const UserProfile = () => {
  const { id } = useParams();

  const [editEvent, setEditEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/organizers/${id}`);
        const data = await res.json();
        setUser(data);
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const initials = useMemo(() => {
    if (!user?.fullname) return "UP";
    return user.fullname
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user)
    return <div className="min-h-screen flex items-center justify-center">User not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/search">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>

        <div className="bg-muted/30 rounded-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-32 w-32">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.fullname} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{user.fullname}</h1>
                    <Badge variant="secondary">{user.verification_status || "N/A"}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {user.role || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {user.sport_name || "N/A"}
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl mb-3">{user.bio || "N/A"}</p>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `${user.fullname} - Profile`,
                          text: `Check out ${user.fullname}'s profile on Athletix`,
                          url: window.location.href,
                        })
                        .catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="Events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 max-w-3xl">
            <TabsTrigger value="Events">Events</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="Events" className="space-y-6">
            <div className="grid gap-4">
              {user.events && user.events.length > 0 ? (
                user.events.map((event: any) => {
                  const status = getEventStatus(event.start_datetime, event.end_datetime);

                  return (
                    <Card key={event.event_id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              <Link to={`/events/${event.event_id}`}>{event.title}</Link>
                            </h3>
                            <p className="text-muted-foreground">
                              {safeFormat(event.start_datetime)} - {safeFormat(event.end_datetime)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={
                                status === "Completed"
                                  ? "destructive"
                                  : status === "Ongoing"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {status}
                            </Badge>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditEvent(event);
                                setModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p>No events available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <Card key={ach.achievement_id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{ach.title}</h3>
                    <p className="text-muted-foreground">{ach.description || "No description"}</p>
                    {ach.year && <Badge variant="secondary">{ach.year}</Badge>}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No achievements available.</p>
            )}
          </TabsContent>
        </Tabs>

        {editEvent && (
          <EventEditModal
            key={editEvent.event_id}
            open={modalOpen}
            event={editEvent}
            onClose={() => setModalOpen(false)}
            onEventUpdated={(updatedEvent) => {
              setUser((prev: any) => ({
                ...prev,
                events: prev.events.map((e: any) =>
                  e.event_id === updatedEvent.event_id ? updatedEvent : e
                ),
              }));
              setModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
