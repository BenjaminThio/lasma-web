import { faWindows, faLinux, faApple, faAndroid } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dropdown from './dropdown';

export default function DropdownPage() {
    return (
        <div style={{
            height: '100svh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 'large',
            gap: '1rem',
            /*overflow: 'hidden'*/
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
            <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '7rem'}}>
                <Dropdown direction={0} options={[
                    {option: 'Hello World', value: 0},
                    {option: '2', value: 1},
                    {option: '3', value: 2}
                ]}/>
                <Dropdown direction={1} options={[
                    {option: 'Ben', value: 0},
                    {option: 'Teh', value: 1},
                    {option: 'Thye', value: 2}
                ]}/>
                <Dropdown direction={1} options={[
                    {option: <FontAwesomeIcon icon={faWindows} fixedWidth/>, value: 0},
                    {option: <FontAwesomeIcon icon={faLinux} fixedWidth/>, value: 1},
                    {option: <FontAwesomeIcon icon={faApple} fixedWidth/>, value: 2},
                    {option: <FontAwesomeIcon icon={faAndroid} fixedWidth/>, value: 3}
                ]}/>
            </div>
        </div>
    );
}