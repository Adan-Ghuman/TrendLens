export default function NotFound() {
    return (
        <main className="page-shell">
            <section className="hero">
                <div className="hero__eyebrow">404</div>
                <h1 className="hero__title">No snapshot here.</h1>
                <p className="hero__lede">
                    The requested page does not exist. Return to the dashboard to inspect the current trending repositories.
                </p>
            </section>
        </main>
    );
}
