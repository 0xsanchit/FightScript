import { NextResponse } from 'next/server';

// Reference the in-memory storage from the parent route
declare let todos: { id: string; title: string; completed: boolean }[];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();
  
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return NextResponse.json(
      { error: 'Todo not found' },
      { status: 404 }
    );
  }

  const updatedTodo = {
    ...todos[todoIndex],
    ...(body.title !== undefined && { title: body.title }),
    ...(body.completed !== undefined && { completed: body.completed }),
  };

  todos[todoIndex] = updatedTodo;
  return NextResponse.json(updatedTodo);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
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