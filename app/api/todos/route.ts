import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for todos (replace with database in production)
let todos: { id: string; title: string; completed: boolean }[] = [];

export async function GET() {
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
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

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Todo ID is required' },
      { status: 400 }
    );
  }

  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return NextResponse.json(
      { error: 'Todo not found' },
      { status: 404 }
    );
  }

  const updatedTodo = {
    ...todos[todoIndex],
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.completed !== undefined && { completed: updates.completed }),
  };

  todos[todoIndex] = updatedTodo;
  return NextResponse.json(updatedTodo);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Todo ID is required' },
      { status: 400 }
    );
  }

  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return NextResponse.json(
      { error: 'Todo not found' },
      { status: 404 }
    );
  }

  todos.splice(todoIndex, 1);
  return new NextResponse(null, { status: 204 });
} 