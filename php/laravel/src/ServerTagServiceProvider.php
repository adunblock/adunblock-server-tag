<?php

namespace Adunblock\ServerTagLaravel;

use Illuminate\Support\ServiceProvider;

class ServerTagServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Package is ready to use via global helper function
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // Helper functions are auto-loaded via composer.json files section
    }
}