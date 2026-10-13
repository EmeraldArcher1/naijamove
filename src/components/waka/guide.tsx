import { Button, Card } from "@/components/waka/ui";
import { ADMIN_KEY } from "@/lib/waka/safety";
import type { Platform } from "@/lib/waka/store";
import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void> };

export function GuidePanel({ platform }: { platform: Exclude<Platform, "gate"> }) {
  return (
    <div className="flex flex-col gap-3">
      <InstallCard />
      <BorrowedCard />
      <StoresCard />
      {platform === "rider" && <RiderManual />}
      {platform === "driver" && <DriverManual />}
      {platform === "admin" && <AdminManual />}
    </div>
  );
}

function InstallCard() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  return (
    <Card>
      <h2 className="font-display text-3xl leading-none tracking-tight">Put it on the phone</h2>
      <p className="mt-2 text-sm text-muted">
        One install holds both platforms. The first screen asks whether you are a customer or a driver.
      </p>
      {prompt && (
        <Button
          className="mt-3"
          onClick={() => {
            void prompt.prompt();
            setPrompt(null);
          }}
        >
          Install NaijaMove
        </Button>
      )}
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-4 text-sm">
        <li>iPhone: open this site in Safari, tap Share, then Add to Home Screen.</li>
        <li>Android: open this site in Chrome, then Install app or Add to Home screen.</li>
        <li>Open the NaijaMove icon. Choose Customer or Driver.</li>
      </ol>
    </Card>
  );
}

function BorrowedCard() {
  return (
    <Card>
      <h2 className="text-lg font-medium">What this app keeps from the others</h2>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-4 text-sm text-muted">
        <li>Pickup now, a later time, a parcel, and a price on each car class before you request.</li>
        <li>You may offer more than the fair fare. You cannot bid the driver down below the floor.</li>
        <li>Hello is the inspected older car: air conditioner on, clean, and a responsible driver. Women and men both drive. Cars under 10 years take every class. Hello stops at 18 years.</li>
        <li>Registration is a name, phone, NIN, and home address. A driver also submits those for a police check. The desk clears it before the car can go online.</li>
      </ul>
    </Card>
  );
}

function StoresCard() {
  return (
    <Card>
      <h2 className="text-lg font-medium">App stores</h2>
      <p className="mt-2 text-sm text-muted">
        NaijaMove is not on the App Store, Play Store, Galaxy Store, AppGallery, or Amazon Appstore yet. Those shops will not take a listing from this preview. Each one needs your own developer account and a public site.
      </p>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-4 text-sm text-muted">
        <li>Publish this site so it has a public https address. Stores will not review a private preview.</li>
        <li>Google Play: open a Play Console account, then ship the published site as an Android app. Customer and driver stay one install.</li>
        <li>Apple App Store: open an Apple Developer account. A Mac has to wrap the site and send it through App Review. Apple can reject a listing that is only a website.</li>
        <li>Samsung, Huawei, and Amazon are separate accounts and separate uploads. There is no switch that sends one build to every store.</li>
      </ol>
    </Card>
  );
}

function RiderManual() {
  return (
    <Card>
      <h2 className="text-lg font-medium">Customer platform</h2>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-4 text-sm text-muted">
        <li>Accept the safety notice. The date is on the notice. A new date asks you again.</li>
        <li>Your name, phone, NIN, and home address are the customer account. A live city confirms the NIN. This preview records it.</li>
        <li>Set pickup and destination, then choose Pickup now or Leave later. Parcel sends a package on the same fare. The price sits on the right of each ride before you request.</li>
        <li>Share is two riders in one car. Keke is the short-hop tricycle. Go is the everyday sedan.</li>
        <li>When a driver is matched, check the name, the car, the colour, and the registration plate.</li>
        <li>Read the trip PIN to the driver. The car does not move until that PIN is entered.</li>
        <li>Share the trip note with someone you trust. This preview saves the note. It does not send a text.</li>
        <li>If you are in danger, call 112 yourself. Then file a report. Theft and illegal acts are recorded against the driver.</li>
        <li>Rate the trip. A loss from damage or theft sits with the driver, not with NaijaMove.</li>
      </ol>
    </Card>
  );
}

function DriverManual() {
  return (
    <Card>
      <h2 className="text-lg font-medium">Driver platform</h2>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-4 text-sm text-muted">
        <li>Register with your name, phone, NIN, home address, and a police criminal-record check. Women and men both drive. A car under 10 years takes every ride. A clean car from 2008 to 2016, with the air conditioner working, takes Hello only.</li>
        <li>Accept the driver charter. You answer for the car, damage, theft, and anything illegal.</li>
        <li>Your licence, vehicle papers, and criminal-record screen must be in date. Expired papers keep you offline.</li>
        <li>Go online. Each request shows the destination, the fuel, the 7% fee, and your take-home before you accept.</li>
        <li>The fare is recommended and locked. A rider may add up to 15%. They cannot bid you down.</li>
        <li>Ask the rider for the PIN and enter it before you start.</li>
        <li>The rider pays NaijaMove. Your share is owed by the company. The desk pays it out. You do not collect the fare.</li>
        <li>A theft or illegal-act report suspends you. File an appeal on Safety. The desk reinstates or refuses, and the decision stays on the audit.</li>
      </ol>
    </Card>
  );
}

function AdminManual() {
  return (
    <Card>
      <h2 className="text-lg font-medium">Desk</h2>
      <p className="mt-2 text-sm text-muted">
        The preview desk key is {ADMIN_KEY}. It opens this phone’s register. It is not a password for a live city.
      </p>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-4 text-sm text-muted">
        <li>Observe trips, plates, and ratings.</li>
        <li>Read complaints and mark a file resolved. Closing a file does not move the loss onto NaijaMove.</li>
        <li>Mark papers expired to take a driver offline, or renew them.</li>
        <li>After a driver appeals a suspension, reinstate or refuse. Both decisions are written to the audit.</li>
      </ol>
    </Card>
  );
}
