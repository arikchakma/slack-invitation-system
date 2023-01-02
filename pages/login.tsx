import { Inter } from '@next/font/google';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
	const [email, setEmail] = useState('');
	const router = useRouter();
	const session = useSession();
	useEffect(() => {
		if (session?.status === 'authenticated') {
			router.push('/projects');
		}
	});

	return (
		<main className="flex items-center justify-center px-5 h-screen">
			<form
				className="w-[min(100vw,424px)] mx-auto p-5 bg-white rounded-md shadow-2xl"
				onSubmit={async (e) => {
					e.preventDefault();
					await signIn('email', { email, redirect: false });
				}}
			>
				<div>
					<label htmlFor="email" className="block text-xs text-gray-600">
						EMAIL ADDRESS
					</label>
					<input
						id="email"
						name="email"
						type="email"
						placeholder="hello@arikko.dev"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
					/>
				</div>
				<button
					className={
						'border-black bg-black text-white hover:bg-white hover:text-black flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none mt-3'
					}
				>
					Send magic link
				</button>
			</form>
		</main>
	);
}