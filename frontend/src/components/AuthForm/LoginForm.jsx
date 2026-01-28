import { useState } from 'react';

function LoginForm( {onLogin} ) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erMessage, setErMessage] = useState(null)

    function handleSubmit(e) {
        e.preventDefault();

        if (!email || !password) {
            setErMessage('Заполните все поля');
            return;
        }

        if (password.length < 6) {
            setErMessage('Пароль должен быть не менее 6 символов');
            return;
        }

        else {
            onLogin(email, password);
        }
    }

    return (
        <div className="max-w-md mx-auto p-8">
            <h4 className="font-bold text-center tracking-tight text-slate-400 sm:text-2xl mb-2">Форма входа</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-4">
                    < input
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введите mail..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    < input
                        type="password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />            
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Войти
                    </button>
                    {erMessage && 
                        <div className="px-4 py-2 bg-red-50 border border-red-100">
                            <p className="text-xl text-center"> {erMessage} </p>
                        </div>
                    }
                </div>
                
            </form>
        </div>
    );
}

export default LoginForm;
