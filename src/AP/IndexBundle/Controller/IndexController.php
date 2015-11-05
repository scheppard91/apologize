<?php

namespace AP\IndexBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class IndexController extends Controller
{
    /**
     * @Route("/")
     * @Template("APIndexBundle:Index:index.html.twig")
     */
    public function indexAction()
    {
        return array();
    }
}
