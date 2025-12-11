<?php
declare(strict_types=1);

namespace App\Helpers {
    class ActivityProxy
    {
        protected $performedOn = null;
        protected $causedBy = null;
        protected $properties = [];

        public function performedOn($model)
        {
            $this->performedOn = $model;
            return $this;
        }

        public function causedBy($user)
        {
            $this->causedBy = $user;
            return $this;
        }

        public function withProperties($props)
        {
            $this->properties = is_array($props) ? $props : (array)$props;
            return $this;
        }

        public function log($description)
        {
            $data = array_merge($this->properties ?? [], [
                'performedOn' => $this->performedOn && is_object($this->performedOn) && property_exists($this->performedOn, 'id') ? $this->performedOn->id : null,
                'causedBy' => $this->causedBy && is_object($this->causedBy) && property_exists($this->causedBy, 'id') ? $this->causedBy->id : null,
            ]);

            \Illuminate\Support\Facades\Log::info($description, $data);
            return true;
        }

        public function __call($name, $arguments)
        {
            return $this;
        }
    }
}

namespace {
    if (!function_exists('activity')) {
        /**
         * Lightweight fallback for Spatie's activity() helper.
         * Returns a proxy that supports chaining used by controllers.
         */
        function activity($logName = null)
        {
            return new \App\Helpers\ActivityProxy();
        }
    }
}
