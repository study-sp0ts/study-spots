import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, Heart, Plus, User, Users, Info, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";

export default function Navbar({ user }) {
  const [contributeOpen, setContributeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests", user?.email],
    queryFn: () => [],
    enabled: !!user,
  });
  const { data: myMemberships = [] } = useQuery({
    queryKey: ["studyGroupMembers"],
    queryFn: () => [],
    enabled: !!user,
  });
  const { data: allGroups = [] } = useQuery({
    queryKey: ["studyGroups"],
    queryFn: () => [],
    enabled: !!user,
  });

  const myHostedGroupIds = allGroups.filter((g) => g.host_email === user?.email).map((g) => g.id);
  const pendingApplications = myMemberships.filter((m) => myHostedGroupIds.includes(m.group_id) && m.status === "pending");
  const hasNotifications = friendRequests.length > 0 || pendingApplications.length > 0;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setContributeOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, []);

  const LangToggle = () => (
    <div className="flex rounded-lg border border-border overflow-hidden text-xs font-semibold">
      <button onClick={() => setLang("de")} className={cn("px-2.5 py-1.5 transition-colors", lang === "de" ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>DE</button>
      <button onClick={() => setLang("en")} className={cn("px-2.5 py-1.5 transition-colors border-l border-border", lang === "en" ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>EN</button>
    </div>
  );

  const ProfileBtn = ({ onClick }) => (
    <div
      onClick={onClick || (() => {
        if (!user) { base44.auth.redirectToLogin(window.location.href); }
        else navigate("/Profile");
      })}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-all border border-transparent hover:border-border cursor-pointer"
    >
      <div className="relative">
        {user?.profile_picture ? (
          <img src={user.profile_picture} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
        {hasNotifications && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
        )}
      </div>
      <span>{user?.full_name?.split(" ")[0] || t.profile}</span>
    </div>
  );

  return (
    <div className="absolute top-0 left-0 right-0 z-[1001] h-[64px]">
      <div className="h-full bg-card/95 backdrop-blur-xl border-b border-border/50 px-4 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <Link to="/Home" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span>StudySpots</span>
          <span className="text-primary">München</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/StudyGroups" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-all border border-transparent hover:border-border">
            <Users className="h-4 w-4" />
            {t.studyGroups}
          </Link>

          {/* Contribute dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setContributeOpen((o) => !o)}
              onMouseEnter={() => setContributeOpen(true)}
              className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border",
                contributeOpen ? "bg-secondary border-border" : "border-transparent hover:bg-secondary")}
            >
              <Plus className="h-4 w-4" />
              {t.contribute}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", contributeOpen && "rotate-180")} />
            </button>
            {contributeOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50" onMouseLeave={() => setContributeOpen(false)}>
                <button onClick={() => { navigate("/Recommend"); setContributeOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary transition-colors">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">{t.recommendPlace}</div>
                    <div className="text-xs text-muted-foreground">{t.submitStudySpot}</div>
                  </div>
                </button>
                <button onClick={() => { navigate("/Donate"); setContributeOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary transition-colors border-t border-border">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">{t.donate}</div>
                    <div className="text-xs text-muted-foreground">{t.keepFree}</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <Link to="/About" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-all border border-transparent hover:border-border">
            <Info className="h-4 w-4" />
            {t.about}
          </Link>

          <LangToggle />

          <ProfileBtn />
        </div>

        {/* Mobile: profile avatar + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <div className="relative cursor-pointer" onClick={() => navigate("/Profile")}>
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
            {hasNotifications && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />}
          </div>
          <button onClick={() => setMobileOpen((o) => !o)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[64px] left-0 right-0 bg-card/98 backdrop-blur-xl border-b border-border shadow-2xl z-50 py-3 px-4 space-y-1">
          <Link to="/StudyGroups" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
            <Users className="h-4 w-4 text-primary" />
            {t.studyGroups}
          </Link>
          <button onClick={() => { navigate("/Recommend"); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors text-left">
            <MapPin className="h-4 w-4 text-primary" />
            {t.recommendPlace}
          </button>
          <button onClick={() => { navigate("/Donate"); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors text-left">
            <Heart className="h-4 w-4 text-red-500" />
            {t.donate}
          </button>
          <Link to="/About" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
            <Info className="h-4 w-4 text-muted-foreground" />
            {t.about}
          </Link>
          <div className="flex items-center justify-between px-3 py-3">
            <span className="text-sm font-medium text-muted-foreground">{t.language}</span>
            <LangToggle />
          </div>
        </div>
      )}
    </div>
  );
}