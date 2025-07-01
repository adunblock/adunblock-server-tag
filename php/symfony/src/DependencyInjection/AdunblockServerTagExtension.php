<?php

namespace Adunblock\ServerTag\Symfony\DependencyInjection;

use Adunblock\ServerTag\Symfony\Twig\AdunblockExtension;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Reference;

class AdunblockServerTagExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container)
    {
        // Register the Twig extension
        $definition = new Definition(AdunblockExtension::class);
        $definition->setArguments([
            new Reference('http_client'),
            new Reference('cache.app')
        ]);
        $definition->addTag('twig.extension');
        
        $container->setDefinition('adunblock.server_tag.twig_extension', $definition);
    }
}