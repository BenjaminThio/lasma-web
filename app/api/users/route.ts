import fs from 'fs';

export async function GET() {
    const data = fs.readFileSync('data/data.json', 'utf-8');
    
    return new Response(data,
    {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const data: Record<string, string | number>[] = JSON.parse(fs.readFileSync('data/data.json', 'utf-8'));

    if (name != null) {
        data.push({name: name, id: 0, score: 0});
        fs.writeFileSync('data/data.json', JSON.stringify(data, null, '\t'), 'utf-8');
    
        return new Response(JSON.stringify(data),
        {
            status: 201,
            headers: {'Content-Type': 'application/json'}
        });
    }
    return new Response(
        JSON.stringify({ error: "Missing 'name' query parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
    );
}