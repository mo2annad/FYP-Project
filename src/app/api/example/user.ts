import { getAllUsers } from '../../../lib/route'

export async function GET() {
  try {
    const { users } = await getAllUsers()
    return Response.json(users)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    )
  }
}