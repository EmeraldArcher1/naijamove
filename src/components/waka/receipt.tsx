import { Button, Card, Money } from "@/components/waka/ui";
import { fareSplit, payLabel, placeById, vehicleName } from "@/lib/waka/model";
import { useWaka, type Receipt } from "@/lib/waka/store";
import { Star } from "lucide-react";

export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const dismiss = useWaka((s) => s.dismissReceipt);
  const rate = useWaka((s) => s.rate);
  const from = placeById(receipt.city, receipt.fromId);
  const to = placeById(receipt.city, receipt.toId);
  const driving = receipt.as === "driver";
  const companyHeld = useWaka((s) => s.companyHeld);
  const driverOwed = useWaka((s) => s.driverOwed);
  const split = fareSplit(receipt.quote);

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-muted">Trip ended</p>
        <h2 className="mt-1 font-display text-3xl leading-none tracking-tight">
          {from.name} to {to.name}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {vehicleName(receipt.vehicle)} · {receipt.driverName} · {receipt.plate} · {payLabel(receipt.pay)}
        </p>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-sm text-muted">{driving ? "You kept" : "You paid"}</span>
        <span className="font-display text-4xl leading-none">
          <Money value={driving ? receipt.quote.driverNet : receipt.quote.riderPays} />
        </span>
      </div>
      <p className="text-sm text-muted">
        {driving ? "After fuel and wear. " : ""}
        This fare added <Money value={split.paidIn} /> to NaijaMove. The company keeps <Money value={split.kept} /> and owes the driver <Money value={split.driverDue} />.
      </p>
      <p className="flex justify-between text-sm">
        <span className="text-muted">Company balance</span>
        <Money value={companyHeld} />
      </p>
      <p className="flex justify-between text-sm">
        <span className="text-muted">Owed to drivers</span>
        <Money value={driverOwed} />
      </p>
      <p className="text-sm text-muted">
        {driving
          ? "The rider’s rating is the record of the trip. Loss from damage, theft, or an illegal act stays with you."
          : "Rate how it went. That record stays. Loss from damage, theft, or an illegal act sits with the driver, not with NaijaMove."}
      </p>
      {!driving && (
        <div>
          <p className="text-sm text-muted">Rate the driver</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="press flex h-11 w-11 items-center justify-center rounded-md border border-line"
                onClick={() => rate(receipt.id, n)}
              >
                <Star className={`size-5 ${receipt.rating !== null && n <= receipt.rating ? "fill-ink text-ink" : "text-faint"}`} />
              </button>
            ))}
          </div>
        </div>
      )}
      <Button full variant="secondary" onClick={dismiss}>
        {driving ? "Back to requests" : "Book another"}
      </Button>
    </Card>
  );
}
