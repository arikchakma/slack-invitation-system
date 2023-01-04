import { cloneElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ProjectUserProps } from '@/types/project';
import { timeAgo } from '@/lib/utils';

export default function UsersTable() {
	const router = useRouter();
	const { slug } = router.query as {
		slug: string;
	};
	const { data: users, status } = useQuery<ProjectUserProps[]>(
		['users', slug],
		async () => {
			return (await fetch(`/api/projects/${slug}/users`)).json();
		},
		{
			enabled: !!slug,
		}
	);
	return (
		<div>
			<h2 className="text-2xl font-bold">Users</h2>
			<ul className="mt-2 flex flex-col gap-2">
				{status === 'loading' ? (
					<>
						{[1, 2].map((item) =>
							cloneElement(
								<li>
									<div className="h-7 bg-slate-200 rounded-sm" />
								</li>,
								{ key: item }
							)
						)}
					</>
				) : (
					<>
						{users?.map((user) => (
							<li key={user.id}>
								<div className="flex items-center justify-between bg-slate-200 gap-5 rounded-sm px-2 py-1">
									<h4 className="font-medium text-sm">{user?.email}</h4>
									<span className="text-xs text-gray-600">
										Joined {timeAgo(user?.joinedAt)}
									</span>
								</div>
							</li>
						))}
					</>
				)}
			</ul>
		</div>
	);
}
