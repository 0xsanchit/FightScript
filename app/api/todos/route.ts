import { NextResponse } from 'next/server';

// In-memory storage for todos (replace with database in production)
let todos: { id: string; title: string; completed: boolean }[] = [];

export async function GET() {
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  if (!body.title) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }

  const newTodo = {
    id: Math.random().toString(36).substring(7),
    title: body.title,
    completed: false,
  };

  todos.push(newTodo);
  return NextResponse.json(newTodo, { status: 201 });
} 