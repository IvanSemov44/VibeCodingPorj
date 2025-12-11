<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TwoFactorSecretResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'provisioning_uri' => $this->resource['provisioning_uri'] ?? null,
            'secret_mask' => $this->resource['secret_mask'] ?? null,
        ];
    }
}
