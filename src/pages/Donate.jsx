import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Coffee, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  { icon: Coffee, label: "Buy a Coffee", amount: 3, desc: "Keep the servers running", color: "from-amber-400 to-orange-400" },
  { icon: Zap, label: "Power Up", amount: 10, desc: "Help us add more features", color: "from-violet-400 to-purple-500" },
  { icon: Star, label: "Super Supporter", amount: 25, desc: "You're a legend 🙌", color: "from-pink-400 to-rose-500" },
];

export default function Donate() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-7 w-7 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Keep StudySpot Munich Free</h1>
          <p className="text-muted-foreground">This platform is built with love for Munich's study community. Your support keeps it free and growing.</p>
        </div>

        <div className="space-y-3 mb-5">
          {tiers.map(({ icon: Icon, label, amount, desc, color }) => (
            <button
              key={label}
              onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all",
                selectedAmount === amount && !customAmount
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-secondary"
              )}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
              <span className="font-bold text-lg text-primary">€{amount}</span>
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground block mb-2">Or enter a custom amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              className={cn("pl-7 rounded-xl", customAmount && "border-primary bg-primary/5")}
            />
          </div>
        </div>

        <Button
          disabled={!finalAmount || finalAmount <= 0}
          className="w-full h-11 rounded-xl"
          onClick={() => alert(`Thank you for your €${finalAmount} donation! Payment integration coming soon 🙏`)}
        >
          <Heart className="h-4 w-4 mr-2 fill-current" />
          Donate {finalAmount ? `€${finalAmount}` : ""}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">All donations go directly to hosting and development costs.</p>
      </div>
    </div>
  );
}