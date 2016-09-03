<?php
/**
 * Created by PhpStorm.
 * User: bouysset
 * Date: 30/08/16
 * Time: 13:41
 */

namespace TeamspeackBundle\TeamspeackAdapater;

use TeamSpeak3\TeamSpeak3;

class TeamspeackAdapter
{
    private $ts3;
    private $password;

    public function __construct($teamspeack_password)
    {
        $this->password = $teamspeack_password;
        $this->ts3 = TeamSpeak3::factory("serverquery://serveradmin:".$this->password."@apologize.ovh:10011/?server_port=9987&nickname=apologize");
    }

    /*foreach ($this->ts3->clientList() as $ts3_Client) {

    if ($ts3_Client == "Azer") {
        $ts3_Client->message("Coucou c'est moi le site apologize.ovh mais tu peut pas me voir je suis pas encore publiquement accessible ;)");
    }
    */
}