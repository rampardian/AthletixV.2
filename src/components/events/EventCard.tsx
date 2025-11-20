import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  type: "tryout" | "competition" | "showcase" | "camp";
  sport: string;
  date: string;
  location: string;
  organizer: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
}

const EventCard = ({
  id,
  title,
  type,
  sport,
  date,
  location,
  description,
  status,
}: EventCardProps) => {
  const typeColors = {
    tryout: "bg-primary text-primary-foreground",
    competition: "bg-accent text-accent-foreground",
    showcase: "bg-secondary text-secondary-foreground",
    camp: "bg-muted text-muted-foreground",
  };

  const statusColors = {
    upcoming: "default",
    ongoing: "secondary",
    completed: "outline",
  } as const;

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className={typeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
          <Badge variant={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
           {sport}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-2">{description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
        </div>
        <div className="mt-4 w-full"></div>
        <Link to={`/events/${id}`} className="w-full">
          <Button variant="secondary" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EventCard;