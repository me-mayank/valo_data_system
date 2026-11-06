import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const secret = request.headers.get('x-revalidate-secret');

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or missing revalidation secret' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { tags = [], paths = [] } = body;

    for (const tag of tags) {
      revalidateTag(tag);
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      ok: true,
      revalidated: true,
      tags,
      paths,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid revalidation request payload' },
      { status: 400 }
    );
  }
}
