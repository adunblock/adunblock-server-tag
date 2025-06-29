<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

if (!function_exists('server_tag')) {
    function server_tag($remoteUrl, $cacheInterval = 300, $renderScript = null)
    {
        $jsFiles = Cache::remember($remoteUrl, $cacheInterval, function () use ($remoteUrl) {
            try {
                $response = Http::get($remoteUrl);
                $response->throw();
                return $response->json();
            } catch (\Exception $e) {
                // Log the error or handle it as needed
                return ['js' => []];
            }
        });

        if (is_callable($renderScript)) {
            return $renderScript($jsFiles);
        }

        $scripts = array_map(function ($src) {
            return "<script src=\"{}\" async><\/script>";
        }, $jsFiles['js'] ?? []);

        return implode("\n", $scripts);
    }
}

