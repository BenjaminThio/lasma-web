'use client';

export default function test() {    
    function report(): string {
        const uuid: string = crypto.randomUUID();
        
        return uuid + " | " + typeof(uuid) + " | " + new Date().toLocaleString();
    }

    return (
        <button onClick={() => console.log(report())}>Click Me</button>
    );
}