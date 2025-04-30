import Dropdown from "./dropdown";

export default function DropdownPage() {
    return (
        <div style={{
            height: '100svh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 'large',
            gap: '1rem'
        }}>
            <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
                <select style={{
                    padding: '0.5rem',
                    fontFamily: 'inherit',
                    fontSize: 'large',
                    borderRadius: '0.5rem',
                    border: 'none'
                }}>
                    <option>Hello World</option>
                    <option>2</option>
                    <option>3</option>
                </select>
            </div>
            <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
                <Dropdown options={[
                    {option: 'Hello World', value: 0},
                    {option: '2', value: 1},
                    {option: '3', value: 2}
                ]}/>
            </div>
        </div>
    );
}