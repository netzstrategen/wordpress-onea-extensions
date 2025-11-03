<?php

/**
 * Abstract Service
 *
 * @package Netzstrategen\Onea\Contracts
 */

namespace Netzstrategen\Onea\Contracts;

/**
 * Abstract Service
 *
 * Base class for all services.
 */
abstract class AbstractService implements ServiceInterface {

	/**
	 * Initialize the service.
	 *
	 * This method must be implemented by all services.
	 *
	 * @return void
	 */
	abstract public function init(): void;
}
