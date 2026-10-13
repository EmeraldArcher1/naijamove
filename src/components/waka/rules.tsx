export function RideRules({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="text-lg font-medium">Before you ride</h2>
      <ul className="mt-2 flex list-disc flex-col gap-2 pl-4 text-sm text-muted">
        <li>Match the plate, the face, and the trip code before you sit. That check is yours.</li>
        <li>The driver is responsible for the driving, for damage, for theft, and for anything illegal. NaijaMove does not take that on.</li>
        <li>A driver goes online only after a licence check, a vehicle check, and a criminal-record screen, and only while those papers are in date. A passed screen is not a promise the trip will be safe.</li>
      </ul>
      <label className="mt-3 flex items-start gap-3 text-sm text-fg">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-ink"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>I accept the safety notice and terms dated 13 Oct 2026. My security choices stay with me. Claims for damage or theft sit with the driver.</span>
      </label>
    </section>
  );
}

export function DriverRules({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="text-lg font-medium">Driver charter</h2>
      <ul className="mt-2 flex list-disc flex-col gap-2 pl-4 text-sm text-muted">
        <li>You answer for the car, the rider’s property, damage, theft, and any illegal act. NaijaMove matches the trip. It does not stand in for you.</li>
        <li>You cannot go online unless your licence, vehicle papers, and criminal-record screen are in date. Expired papers take you offline the same day.</li>
        <li>Riders rate the trip. That record stays. Their loss does not move onto the company.</li>
      </ul>
      <label className="mt-3 flex items-start gap-3 text-sm text-fg">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-ink"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>I accept the driver charter and terms dated 13 Oct 2026. I am responsible for what happens on my trips.</span>
      </label>
    </section>
  );
}
