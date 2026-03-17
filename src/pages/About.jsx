import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Shield, FileText, Heart, Phone } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">About StudySpot Munich</h1>
            <p className="text-sm text-muted-foreground">Community-driven study spot finder</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* About */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-3">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              StudySpot Munich is a community-driven platform helping students, remote workers, and lifelong learners
              find the best places to study in Munich. From cozy cafés to quiet libraries, we map them all — and you
              can contribute too.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Contact
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:hello@studyspot-munich.de" className="text-primary hover:underline">hello@studyspot-munich.de</a>
              </div>
              <p className="text-muted-foreground text-xs mt-2">We typically respond within 1–2 business days.</p>
            </div>
          </section>

          {/* Impressum */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Impressum (Legal Notice)
            </h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">StudySpot Munich</p>
              <p>[Your Full Name]</p>
              <p>[Your Street and Number]</p>
              <p>[Postcode] Munich, Germany</p>
              <p className="pt-1">E-Mail: hello@studyspot-munich.de</p>
              <p className="pt-2 text-xs italic">
                Responsible for content according to § 55 Abs. 2 RStV: [Your Name], address as above.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Privacy Policy (Datenschutz)
            </h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>We take your privacy seriously. Here's what we collect and why:</p>
              <div>
                <p className="font-medium text-foreground mb-1">Data we collect:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Account email and display name (for authentication)</li>
                  <li>Locations you save as favorites</li>
                  <li>Study groups you create, join, or bookmark</li>
                  <li>Photos you voluntarily upload (license-free or self-made only)</li>
                  <li>Reviews and comments you post</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Your rights (GDPR):</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Right to access, correct, or delete your data</li>
                  <li>Right to data portability</li>
                  <li>Right to withdraw consent at any time</li>
                </ul>
              </div>
              <p>Your data is never sold to third parties. To request data deletion, contact us at hello@studyspot-munich.de.</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-lg mb-3">Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Location information is provided by the community and may not always be up to date. We are not liable for
              incorrect opening hours, changed conditions, or any damages arising from use of this platform. Please verify
              details directly with the respective venues.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              All user-submitted photos must be either self-taken or license-free (e.g. CC0). By uploading a photo, you
              confirm you hold the rights or it is under a free license.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}