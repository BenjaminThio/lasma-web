import { redirect } from 'next/navigation';

interface TestProps {
    redirectRoute: string;
}

export default function Test({redirectRoute}: TestProps) {
    return (
        <td onClick={() => {
            redirect(`/app/${redirectRoute}`);
        }}>

        </td>
    );
}