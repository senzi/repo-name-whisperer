/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const API_BASE_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

export default {
	async fetch(request, env, ctx) {
		// 处理 CORS 预检请求
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Max-Age': '86400',
				}
			});
		}

		// 只处理 POST 请求
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({
				success: false,
				error: 'Method not allowed'
			}), {
				status: 405,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		try {
			// 解析请求体
			const { description, techStack, mustInclude } = await request.json();
			console.log('Received request:', { description, techStack, mustInclude });

			// 验证必填参数
			if (!description) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Description is required'
					}),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						}
					}
				);
			}

			// 构建 system prompt
			const systemPrompt = `You are RepoNameWhisperer, an expert in creating GitHub repository names.
Your response must be a valid JSON object with the following format:
{
  "name": "example-repo-name",
  "description": "A short description of the repository"
}`;

			// 构建 user prompt
			const userPrompt = `Please generate a repository name and description following these guidelines:

1. Name Requirements:
   - Use kebab-case (lowercase with hyphens)
   - Maximum 25 characters
   - Must be memorable and professional
   - Avoid generic terms like "app" or "project" at the end
   ${mustInclude ? `- Must include these terms: ${mustInclude}` : ''}

2. Description Requirements:
   - Maximum 100 characters
   - Start with "A/An"
   - Highlight key functionality
   - Must mention ${techStack || 'relevant technology'}
   - Professional and concise tone
   - No emojis or special characters

Project Description: ${description}
Tech Stack: ${techStack || 'not specified'}

Return the result as a JSON object with "name" and "description" fields.`;

			console.log('Sending request to DeepSeek API...');

			// 调用 DeepSeek API
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 30000); // 30 秒超时

			try {
				const response = await fetch(API_BASE_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
					},
					body: JSON.stringify({
						model: MODEL,
						messages: [
							{
								role: 'system',
								content: systemPrompt
							},
							{
								role: 'user',
								content: userPrompt
							}
						],
						temperature: 1.2,
						max_tokens: 300,
						response_format: {
							type: 'json_object'
						}
					}),
					signal: controller.signal
				});

				clearTimeout(timeout);

				if (!response.ok) {
					const errorText = await response.text();
					console.error('API Response not OK:', {
						status: response.status,
						statusText: response.statusText,
						headers: Object.fromEntries(response.headers.entries()),
						body: errorText
					});
					throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
				}

				// 处理 API 响应
				const result = await response.json();
				console.log('DeepSeek API response:', result);

				// 解析返回的 JSON
				let aiResponse;
				try {
					aiResponse = JSON.parse(result.choices[0].message.content);
				} catch (parseError) {
					console.error('Parse error:', parseError, 'Response:', result);
					throw new Error(`Failed to parse AI response: ${result.choices[0].message.content}`);
				}

				// 返回结果
				return new Response(
					JSON.stringify({
						success: true,
						data: {
							name: aiResponse.name,
							description: aiResponse.description
						}
					}),
					{
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						}
					}
				);

			} catch (error) {
				if (error.name === 'AbortError') {
					console.error('Request timed out:', error);
					return new Response(
						JSON.stringify({
							success: false,
							error: 'Request timed out'
						}),
						{
							status: 408,
							headers: {
								'Content-Type': 'application/json',
								'Access-Control-Allow-Origin': '*'
							}
						}
					);
				} else {
					throw error;
				}
			}

		} catch (error) {
			// 错误处理
			console.error('Error:', error);
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Internal server error',
					details: error.message
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				}
			);
		}
	},
};
