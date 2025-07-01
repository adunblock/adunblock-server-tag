<?php

namespace Adunblock\ServerTag\Symfony;

use Adunblock\ServerTag\Symfony\DependencyInjection\AdunblockServerTagExtension;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class AdunblockServerTagBundle extends Bundle
{
    public function getContainerExtension()
    {
        return new AdunblockServerTagExtension();
    }
}