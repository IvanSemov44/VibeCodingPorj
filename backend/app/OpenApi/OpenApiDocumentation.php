<?php

declare(strict_types=1);

namespace App\OpenApi;

use GoldSpecDigital\ObjectOrientedOAS\Contracts\Arrayable;
use GoldSpecDigital\ObjectOrientedOAS\Objects\BaseObject;
use GoldSpecDigital\ObjectOrientedOAS\Objects\Components;
use GoldSpecDigital\ObjectOrientedOAS\Objects\ExternalDocumentation;
use GoldSpecDigital\ObjectOrientedOAS\Objects\Info;
use GoldSpecDigital\ObjectOrientedOAS\Objects\OpenApi;
use GoldSpecDigital\ObjectOrientedOAS\Objects\PathItem;
use GoldSpecDigital\ObjectOrientedOAS\Objects\Paths;
use GoldSpecDigital\ObjectOrientedOAS\Objects\SecurityScheme;
use GoldSpecDigital\ObjectOrientedOAS\Objects\Server;
use Vyuldashev\LaravelOpenApi\Contracts\Documentable;

final class OpenApiDocumentation implements Documentable
{
    /**
     * Get the OpenAPI specification.
     */
    public static function get(): OpenApi|Arrayable
    {
        return OpenApi::create()
            ->info(
                Info::create()
                    ->title('VibeCoding API')
                    ->version('1.0.0')
                    ->description(
                        'Complete REST API for VibeCoding platform. ' .
                        'Discover tools, share feedback, connect with developers, ' .
                        'and track your learning journey.'
                    )
                    ->termsOfService('https://vibecoding.com/terms')
                    ->contactName('VibeCoding Support')
                    ->contactEmail('support@vibecoding.com')
                    ->contactUrl('https://vibecoding.com/support')
                    ->licenseName('MIT')
                    ->licenseUrl('https://opensource.org/licenses/MIT')
            )
            ->servers(
                Server::create()
                    ->url('http://localhost:8201/api')
                    ->description('Development Server'),
                Server::create()
                    ->url('https://api.vibecoding.com')
                    ->description('Production Server'),
            )
            ->externalDocs(
                ExternalDocumentation::create()
                    ->url('https://docs.vibecoding.com')
                    ->description('Full API Documentation')
            )
            ->components(
                Components::create()
                    ->securityScheme(
                        'sanctum',
                        SecurityScheme::create()
                            ->type('http')
                            ->scheme('bearer')
                            ->bearerFormat('token')
                            ->description('Sanctum API Token')
                    )
            );
    }
}
