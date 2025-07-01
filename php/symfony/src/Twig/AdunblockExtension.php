<?php

namespace Adunblock\ServerTag\Symfony\Twig;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AdunblockExtension extends AbstractExtension
{
    private $httpClient;
    private $cache;

    public function __construct(HttpClientInterface $httpClient, CacheItemPoolInterface $cache)
    {
        $this->httpClient = $httpClient;
        $this->cache = $cache;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('server_tag', [$this, 'serverTag'], ['is_safe' => ['html']]),
        ];
    }

    public function serverTag(string $remoteUrl, int $cacheInterval = 300, callable $renderScript = null): string
    {
        $cacheItem = $this->cache->getItem(md5($remoteUrl));

        if (!$cacheItem->isHit()) {
            try {
                $response = $this->httpClient->request('GET', $remoteUrl);
                $jsFiles = $response->toArray();
                $cacheItem->set($jsFiles);
                $cacheItem->expiresAfter($cacheInterval);
                $this->cache->save($cacheItem);
            } catch (\Exception $e) {
                // Log the error or handle it as needed
                $jsFiles = ['js' => []];
            }
        } else {
            $jsFiles = $cacheItem->get();
        }

        if (is_callable($renderScript)) {
            return $renderScript($jsFiles);
        }

        $scripts = array_map(function ($src) {
            return sprintf('<script src="%s" async></script>', htmlspecialchars($src, ENT_QUOTES, 'UTF-8'));
        }, $jsFiles['js'] ?? []);

        return implode("\n", $scripts);
    }
}
