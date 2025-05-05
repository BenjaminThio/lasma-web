export default function ShapesPage() {
    return (
        <div style={{
            height: '100svh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3rem'
        }}>
            <div style={{
                marginTop: '4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                <div style={{
                    width: 0,
                    height: 0,
                    borderRight: '5rem solid transparent',
                    borderBottom: '5rem solid white',
                    borderLeft: '5rem solid transparent',
                }}/>
                <div style={{
                    fontSize: 'large',
                    textAlign: 'center',
                    backgroundColor: '#282a2c',
                    width: 'fit-content',
                    padding: '0.5rem',
                    borderRadius: '0.7rem'
                }}>
                    TRIANGLE
                </div>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                <div style={{
                    width: 0,
                    height: 0,
                    border: 'solid white',
                    borderWidth: '1rem 1rem 0 0',
                    padding: '2rem',
                    rotate: '-45deg'
                }}/>
                <div style={{
                    fontSize: 'large',
                    textAlign: 'center',
                    backgroundColor: '#282a2c',
                    width: 'fit-content',
                    padding: '0.5rem',
                    borderRadius: '0.7rem'
                }}>
                    ARROW
                </div>
            </div>            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    height: '7rem',
                    aspectRatio: 1,
                    borderRadius: '100%'
                }}/>
                <div style={{
                    fontSize: 'large',
                    textAlign: 'center',
                    backgroundColor: '#282a2c',
                    width: 'fit-content',
                    padding: '0.5rem',
                    borderRadius: '0.7rem'
                }}>
                    CIRCLE
                </div>
            </div>
        </div>
    );
}