/** Liveness probe for load balancers and uptime monitors. Touches nothing, so it's free to call. */
export function GET() {
    return Response.json(
        { status: 'ok', uptime: Math.floor(process.uptime()) },
        { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
    );
}
