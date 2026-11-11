import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="page-kicker">404</p>
      <h1 className="page-title mt-2">This page isn&apos;t in the lineup.</h1>
      <p className="lede mx-auto mt-4">
        The roster, card, or link you asked for is not here.
      </p>
      <Link href="/team/select" className="btn-primary mt-8">
        Pick a team
      </Link>
    </div>
  );
}
