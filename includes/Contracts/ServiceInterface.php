<?php

/**
 * Service Contract
 *
 * @package Netzstrategen\Onea\Contracts
 */

namespace Netzstrategen\Onea\Contracts;

/**
 * Service Interface
 *
 * All services must implement this interface.
 */
interface ServiceInterface {

	/**
	 * Initialize the service.
	 *
	 * This is where services register WordPress hooks,
	 * set up listeners, and perform bootstrapping.
	 *
	 * @return void
	 */
	public function init(): void;
}
