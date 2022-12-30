// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { withProjectAuth } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default withProjectAuth(
	async (req: NextApiRequest, res: NextApiResponse, project) => {
		const { slug } = req.query;

		// Check if the slug is valid
		if (!slug || typeof slug !== 'string')
			return res.status(400).json({ error: 'Invalid project slug' });

		if (req.method === 'GET') {
			/**
			 * GET: /api/projects/[slug]/invite – get all pending invitations
			 * TODO: 1. Get all pending invitations for the project
			 * TODO: 2. Return the invitations
			 */
			const invites = await prisma.projectInvite.findMany({
				where: {
					projectId: project?.id,
				},
				select: {
					email: true,
					createdAt: true,
				},
			});
			return res.status(200).json(
				invites.map((invite) => ({
					email: invite.email,
					invitedAt: invite.createdAt,
				}))
			);
		} else if (req.method === 'POST') {
			/**
			 * POST: /api/projects/[slug]/invite – invite a teammate
			 * TODO: 1. Check if the user is authenticated
			 * TODO: 2. Check if the user is the owner of the project
			 * TODO: 3. Check if the user is already a member of the project
			 * TODO: 4. Check if the user is already invited to the project
			 * TODO: 5. Create a token
			 * TODO: 6. Hash the token
			 * TODO: 7. Save the token to the database
			 * TODO: 8. Send an email to the user
			 * TODO: 9. Return a success message
			 */
		} else {
			res.setHeader('Allow', ['GET', 'POST']);
			return res
				.status(405)
				.json({ error: `Method ${req.method} Not Allowed` });
		}
	}
);
