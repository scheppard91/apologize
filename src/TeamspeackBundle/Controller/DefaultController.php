<?php

namespace TeamspeackBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class DefaultController extends Controller
{
    /**
     * @Route("/ts3")
     */
    public function indexAction()
    {
        $TeamspeackAdapter = $this->container->get('teamspeack.teamspeackadapater');

        return $this->render('TeamspeackBundle:Default:index.html.twig');
    }
}
