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
                $data = $response->json();
                // New format: API returns array directly instead of object with js property
                if (is_array($data) && !isset($data['js'])) {
                    // New format: array directly
                    return ['js' => $data];
                } elseif (is_array($data) && isset($data['js'])) {
                    // Old format: object with js property (backward compatibility)
                    return $data;
                } else {
                    return ['js' => []];
                }
            } catch (\Exception $e) {
                // Log the error or handle it as needed
                return ['js' => []];
            }
        });

        if (is_callable($renderScript)) {
            return $renderScript($jsFiles);
        }

        $scripts = array_map(function ($src) {
            return "<script src=\"{$src}\" async><\/script>";
        }, $jsFiles['js'] ?? []);

        return implode("\n", $scripts);
    }
}

