import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mock user for now - replace with actual auth
const mockUser = {
  id: 'user-1',
  role: 'OPERATOR' as const,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const articles = await db.knowledgeArticle.findMany({
      where: category ? { category } : {},
      include: {
        author: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching knowledge articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags, isPublished } = body;

    const article = await db.knowledgeArticle.create({
      data: {
        title,
        content,
        category,
        tags,
        isPublished: isPublished ?? false,
        authorId: mockUser.id,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating knowledge article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
