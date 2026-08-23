// The generated OpenNext Worker owns server initialization. Keeping this
// module as an explicit no-op prevents Next's Node server barrel from being
// pulled into the Worker graph.
export function register(): void {}
