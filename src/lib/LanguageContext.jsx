import React, { createContext, useContext, useState } from "react";

const de = {
  // Navbar
  studyGroups: "Lerngruppen",
  contribute: "Beitragen",
  recommendPlace: "Ort empfehlen",
  submitStudySpot: "Lernort einreichen",
  donate: "Spenden",
  keepFree: "Diese Website kostenlos halten",
  about: "Über uns",
  profile: "Profil",
  // Home
  loadingSpots: "Lernorte werden geladen...",
  spotsFound: (n) => `${n} Lernort${n !== 1 ? "e" : ""} gefunden`,
  // Profile
  backToMap: "Zurück zur Karte",
  savedSpots: "Gespeicherte Orte",
  upcomingGroups: "Bevorstehend",
  pastGroups: "Vergangen",
  friends: "Freunde",
  sessionsAttended: "Besuchte Sessions",
  sessionsCreated: "Erstellte Sessions",
  noSavedSpots: "Noch keine gespeicherten Orte.",
  noUpcomingGroups: "Keine bevorstehenden Lerngruppen.",
  noPastGroups: "Noch keine vergangenen Lerngruppen.",
  browseGroups: "Lerngruppen durchsuchen →",
  pendingNotifications: (n) => `${n} ausstehende Benachrichtigung${n !== 1 ? "en" : ""}`,
  wantsFriend: "möchte dein Freund sein",
  appliedTo: "hat sich beworben für",
  review: "Prüfen →",
  editProfile: "Profil bearbeiten",
  displayName: "Anzeigename",
  nameManaged: "Name wird von deinem Kontoanbieter verwaltet.",
  bio: "Bio",
  bioPlaceholder: "Erzähl anderen von dir...",
  profilePictureUrl: "Profilbild-URL",
  save: "Speichern",
  cancel: "Abbrechen",
  loggedInAs: "Angemeldet als",
  logout: "Abmelden",
  joined: "Beigetreten",
  // Auth guard
  loginRequired: "Anmeldung erforderlich",
  loginToSave: "Bitte melde dich an, um diesen Ort zu speichern.",
  loginToCreate: "Bitte melde dich an, um eine Lerngruppe zu erstellen.",
  loginToProfile: "Bitte melde dich an, um dein Profil zu sehen.",
  signIn: "Anmelden",
  // Study Groups
  createGroup: "Gruppe erstellen",
  findPeople: "Finde Lernpartner in München",
  searchGroups: "Titel, Fach, Beschreibung suchen...",
  groupsFound: (n) => `${n} Gruppe${n !== 1 ? "n" : ""} gefunden`,
  noGroupsFound: "Keine Lerngruppen gefunden",
  tryAdjusting: "Passe deine Filter an oder erstelle eine!",
  // Location Detail
  amenities: "Ausstattung",
  seating: "Sitzplätze",
  inside: "Innen",
  outside: "Außen",
  about: "Über",
  reviewsComments: "Bewertungen & Kommentare",
  noReviewsYet: "Noch keine Bewertungen. Sei der/die Erste!",
  shareExperience: "Teile deine Erfahrung (optional)...",
  postReview: "Bewertung abgeben",
  logInToReview: "Anmelden zum Bewerten.",
  viewMenu: "Speise- & Getränkekarte anzeigen",
  // Misc
  host: "Gastgeber",
  member: "Mitglied",
  pending: "Ausstehend",
  saved: "Gespeichert",
  cancelled: "Abgesagt",
  language: "Sprache",
};

const en = {
  studyGroups: "Study Groups",
  contribute: "Contribute",
  recommendPlace: "Recommend a Place",
  submitStudySpot: "Submit a study spot",
  donate: "Donate",
  keepFree: "Keep this website free",
  about: "About",
  profile: "Profile",
  loadingSpots: "Loading study spots...",
  spotsFound: (n) => `${n} study spot${n !== 1 ? "s" : ""} found`,
  backToMap: "Back to Map",
  savedSpots: "Saved Spots",
  upcomingGroups: "Upcoming",
  pastGroups: "Past",
  friends: "Friends",
  sessionsAttended: "Sessions Attended",
  sessionsCreated: "Sessions Created",
  noSavedSpots: "No saved spots yet.",
  noUpcomingGroups: "No upcoming study groups.",
  noPastGroups: "No past study groups yet.",
  browseGroups: "Browse study groups →",
  pendingNotifications: (n) => `${n} pending notification${n !== 1 ? "s" : ""}`,
  wantsFriend: "wants to be your friend",
  appliedTo: "applied to",
  review: "Review →",
  editProfile: "Edit profile",
  displayName: "Display name",
  nameManaged: "Name is managed by your account provider.",
  bio: "Bio",
  bioPlaceholder: "Tell others about yourself...",
  profilePictureUrl: "Profile picture URL",
  save: "Save",
  cancel: "Cancel",
  loggedInAs: "Logged in as",
  logout: "Log out",
  joined: "Joined",
  loginRequired: "Login required",
  loginToSave: "Please sign in to save this spot.",
  loginToCreate: "Please sign in to create a study group.",
  loginToProfile: "Please sign in to view your profile.",
  signIn: "Sign In",
  createGroup: "Create Group",
  findPeople: "Find people to study with in Munich",
  searchGroups: "Search by title, subject, description...",
  groupsFound: (n) => `${n} group${n !== 1 ? "s" : ""} found`,
  noGroupsFound: "No study groups found",
  tryAdjusting: "Try adjusting your filters or create one!",
  amenities: "Amenities",
  seating: "Seating",
  inside: "Inside",
  outside: "Outside",
  about: "About",
  reviewsComments: "Reviews & Comments",
  noReviewsYet: "No reviews yet. Be the first!",
  shareExperience: "Share your experience (optional)...",
  postReview: "Post Review",
  logInToReview: "Log in to leave a review.",
  viewMenu: "View Food & Drinks Menu",
  host: "Host",
  member: "Member",
  pending: "Pending",
  saved: "Saved",
  cancelled: "Cancelled",
  language: "Language",
};

export const translations = { de, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("de");
  const t = translations[lang];
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}