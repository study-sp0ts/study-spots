import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Shield, FileText } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Über StudySpots</h1>
            <p className="text-sm text-muted-foreground">Community-orientierter Lernort- & Lerngruppen-Finder</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* About */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-3">Über uns</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              StudySpots ist eine community-orientierte Plattform, die Studierenden, Remote-Arbeitenden 
              und Lernenden hilft, die besten Lernorte und Lerntreffen zu finden. Von cozy Cafés über sonnige Parks bis 
              hin zu ruhigen Bibliotheken - wir haben sie alle! Und auch du kannst dazu beitragen.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Kontakt
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@study-spots.com" className="text-primary hover:underline">info@study-spots.com</a>
              </div>
              {/* <p className="text-muted-foreground text-xs mt-2">We typically respond within 1–2 business days.</p>*/} 
            </div>
          </section>

          {/* Impressum */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Impressum 
            </h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">StudySpots München</p>
              <p>[Your Full Name]</p>
              <p>[Your Street and Number]</p>
              <p>[Postcode] Munich, Germany</p>
              <p className="pt-1">E-Mail:info@study-spot.com</p>
              <p className="pt-2 text-xs italic">
                Verantwortlich für Inhalte gemäß § 55 Abs. 2 RStV: [Your Name], address as above.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Datenschutz
            </h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>Wir nehmen den Schutz deiner Daten ernst. Hier erfahrst du, welche Daten wir erheben und warum:</p>
              <div>
                <p className="font-medium text-foreground mb-1">Was wir erheben:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Mail & Name, unter denen dein Profil läuft</li>
                  <li>StudySpots, die du zu deinen Favoriten hinzufügst</li>
                  <li>StudySessions, die du erstellst, speicherst oder denen du beitrittst </li>
                  <li>Fotos, die du freiwillig hochlädst (lizenzfrei oder selbstgemacht)</li>
                  <li>Bewertungen & Kommentare, die du postest</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Deine Rechte (DSGVO):</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Einsicht, Korrektur und Löschung aller persönlicher Daten</li>
                  <li>Datenübertragbarkeit</li>
                  <li>Möglichkeit, Zustimmung jederzeit zu widerrufen</li>
                </ul>
              </div>
              <p>Nutzerdaten werden zu keinem Zeitpunkt an Dritte weitergegeben. Um deine Daten einzusehen, korriegieren oder löschen zu lassen, schreibe uns eine Mail an info@study-spots.com.</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-3">Haftungsausschluss</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Viele Location-Details werden von der Community eingereicht und sind möglicherweise nicht immer aktuell. 
              StudySpots übernimmt keine Haftung für falsche Öffnungszeiten, geänderte Bedingungen oder Schäden, die 
              durch die Nutzung dieser Plattform entstehen. Bitte überprüfe wichtige Details direkt beim jeweiligen Ort.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Alle von Nutzern hochgeladenen Bilder müssen entweder selbst aufgenommen oder lizenzfrei sein. Mit dem 
              Hochladen eines Bilder bestätigst du, dass du die Rechte daran innehältst oder dass es lizenzfrei ist.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}