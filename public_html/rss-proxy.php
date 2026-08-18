<?php
/**
 * rss-proxy.php v2.2 - Secure Backend Proxy for Sanctuary Shield
 * 
 * Broader RSS support + improved diagnostics
 */

$allowedHosts = ['news.google.com'];

$cacheDir = __DIR__ . '/rss-cache';
$cacheTime = 300; // 5 minutes
$timeout = 10;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$rssUrl = trim($_GET['url'] ?? '');

if (!$rssUrl || !filter_var($rssUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or missing URL']);
    exit;
}

$host = strtolower(parse_url($rssUrl, PHP_URL_HOST) ?? '');
if (!in_array($host, $allowedHosts)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Domain not allowed']);
    exit;
}

// Cache setup
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}
$cacheFile = $cacheDir . '/' . md5($rssUrl) . '.json';

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
    echo file_get_contents($cacheFile);
    exit;
}

// Fetch RSS
$context = stream_context_create([
    'http' => [
        'timeout' => $timeout,
        'user_agent' => 'SanctuaryShield-RSS-Proxy/2.2',
        'follow_location' => true,
    ]
]);

$xmlString = @file_get_contents($rssUrl, false, $context);

if (!$xmlString || strlen($xmlString) < 100) {
    http_response_code(502);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch RSS feed or response too small',
        'debug' => ['url' => $rssUrl]
    ]);
    exit;
}

// Parse
libxml_use_internal_errors(true);
$xml = simplexml_load_string($xmlString, 'SimpleXMLElement', LIBXML_NOCDATA);

if ($xml === false) {
    http_response_code(502);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to parse RSS XML',
        'debug' => ['url' => $rssUrl]
    ]);
    exit;
}

$items = [];
$channelTitle = (string)($xml->channel->title ?? 'News Source');

if (isset($xml->channel->item)) {
    foreach ($xml->channel->item as $item) {
        $items[] = [
            'title'       => trim((string)($item->title ?? '')),
            'link'        => trim((string)($item->link ?? '')),
            'description' => trim((string)($item->description ?? $item->summary ?? '')),
            'pubDate'     => trim((string)($item->pubDate ?? '')),
            'source'      => $channelTitle,
        ];
    }
}

$result = [
    'status' => 'ok',
    'feed' => [
        'url' => $rssUrl,
        'title' => $channelTitle
    ],
    'items' => array_slice($items, 0, 20)
];

// Cache result
@file_put_contents($cacheFile, json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);