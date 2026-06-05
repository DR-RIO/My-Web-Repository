import type { APIRoute } from 'astro';

// 这个是一个简单的点赞 API 示例
// 注意：在实际生产环境中，你应该使用数据库（如 Vercel KV、Upstash Redis 等）来存储点赞数据
// 这个示例使用内存存储，仅用于演示，重启服务器后数据会丢失

interface LikeData {
  [key: string]: number;
}

// 简单的内存存储（生产环境请替换为数据库）
let likesData: LikeData = {};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ 
        error: '缺少 id 参数' 
      }), 
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  const count = likesData[id] || 0;
  
  return new Response(
    JSON.stringify({ 
      id, 
      count 
    }), 
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return new Response(
        JSON.stringify({ 
          error: '缺少必要参数' 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!likesData[id]) {
      likesData[id] = 0;
    }

    if (action === 'like') {
      likesData[id]++;
    } else if (action === 'unlike') {
      likesData[id] = Math.max(0, likesData[id] - 1);
    } else {
      return new Response(
        JSON.stringify({ 
          error: '无效的 action 参数' 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        id, 
        count: likesData[id] 
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: '服务器错误' 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
